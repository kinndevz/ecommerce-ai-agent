import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.account import AccountService
from app.services.preferences import PreferenceService
from app.schemas.account import UpdateUserProfileRequest, ChangePasswordRequest
from app.schemas.preferences import UpdateUserPreferenceRequest


# HELPER


def build_query_chain(first=None, all_result=None):
    q = MagicMock()
    for attr in ("filter", "options", "join", "order_by", "offset", "limit"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    return q


# GET MY PROFILE


class TestGetMyProfile:

    def test_existing_user_returns_profile(self, mock_db, mock_user, user_id):
        """User tồn tại → trả về profile với role."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        result = AccountService.get_my_profile(mock_db, user_id)

        assert result["success"] is True
        assert result["data"] == mock_user

    def test_user_not_found_raises_404(self, mock_db):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            AccountService.get_my_profile(mock_db, "ghost-id")

        assert exc_info.value.status_code == 404

    def test_uses_joinedload_for_role_and_permissions(
        self, mock_db, mock_user, user_id
    ):
        """Query phải dùng options() để load role+permissions."""
        q = build_query_chain(first=mock_user)
        mock_db.query.return_value = q

        AccountService.get_my_profile(mock_db, user_id)

        q.options.assert_called_once()


# UPDATE PROFILE


class TestUpdateProfile:

    def test_valid_update_returns_updated_profile(
        self, mock_db, mock_user, user_id
    ):
        """Update thành công → db.commit() gọi, trả về user."""
        mock_db.query.return_value = build_query_chain(first=mock_user)
        mock_db.refresh.side_effect = lambda obj: None

        data = UpdateUserProfileRequest(full_name="New Name")
        result = AccountService.update_profile(mock_db, user_id, data)

        assert result["success"] is True
        assert mock_user.full_name == "New Name"
        mock_db.commit.assert_called_once()

    def test_user_not_found_raises_404(self, mock_db):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            AccountService.update_profile(
                mock_db, "ghost-id",
                UpdateUserProfileRequest(full_name="X")
            )

        assert exc_info.value.status_code == 404

    def test_only_provided_fields_are_updated(
        self, mock_db, mock_user, user_id
    ):
        """Chỉ field được truyền mới bị update — field None giữ nguyên."""
        original_phone = mock_user.phone_number
        mock_db.query.return_value = build_query_chain(first=mock_user)
        mock_db.refresh.side_effect = lambda obj: None

        data = UpdateUserProfileRequest(
            full_name="New Name")  # phone_number=None
        AccountService.update_profile(mock_db, user_id, data)

        assert mock_user.full_name == "New Name"
        assert mock_user.phone_number == original_phone  # không thay đổi

    def test_reloads_with_joinedload_after_commit(
        self, mock_db, mock_user, user_id
    ):
        """Sau commit phải reload với joinedload để lấy role+permissions."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = mock_user
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        data = UpdateUserProfileRequest(avatar="https://example.com/img.jpg")
        AccountService.update_profile(mock_db, user_id, data)

        # query gọi ít nhất 2 lần: lần 1 get user, lần 2 reload với joinedload
        assert call_count >= 2


# CHANGE PASSWORD


class TestChangePassword:

    def _make_request(self, old="old_pass", new="new_pass", confirm="new_pass"):
        return ChangePasswordRequest(
            old_password=old,
            new_password=new,
            confirm_new_password=confirm
        )

    def test_valid_change_updates_password(
        self, mock_db, mock_user, user_id
    ):
        """Password cũ đúng, mật khẩu mới hợp lệ → cập nhật thành công."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with patch("app.services.account.verify_password", return_value=True), \
            patch("app.services.account.hash_password",
                  return_value="new_hashed"):
            result = AccountService.change_password(
                mock_db, user_id, self._make_request()
            )

        assert result["success"] is True
        assert result["message"] == "Password changed successfully"
        assert mock_user.password == "new_hashed"
        mock_db.commit.assert_called_once()

    def test_passwords_do_not_match_raises_400(
        self, mock_db, user_id
    ):
        """new_password != confirm_new_password → raise 400."""
        mock_db.query.return_value = build_query_chain(first=MagicMock())

        with pytest.raises(HTTPException) as exc_info:
            AccountService.change_password(
                mock_db, user_id,
                self._make_request(new="new_pass", confirm="different")
            )

        assert exc_info.value.status_code == 400
        assert "match" in exc_info.value.detail["message"].lower()

    def test_new_same_as_old_raises_400(
        self, mock_db, user_id
    ):
        """new_password == old_password → raise 400."""
        mock_db.query.return_value = build_query_chain(first=MagicMock())

        with pytest.raises(HTTPException) as exc_info:
            AccountService.change_password(
                mock_db, user_id,
                self._make_request(old="same_pass", new="same_pass",
                                   confirm="same_pass")
            )

        assert exc_info.value.status_code == 400

    def test_user_not_found_raises_404(self, mock_db, user_id):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            AccountService.change_password(
                mock_db, user_id, self._make_request()
            )

        assert exc_info.value.status_code == 404

    def test_wrong_old_password_raises_400(
        self, mock_db, mock_user, user_id
    ):
        """Sai mật khẩu cũ → raise 400."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with patch("app.services.account.verify_password", return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                AccountService.change_password(
                    mock_db, user_id, self._make_request()
                )

        assert exc_info.value.status_code == 400
        assert "incorrect" in exc_info.value.detail["message"].lower()


# GET MY PREFERENCES


class TestGetMyPreferences:

    def test_existing_preference_returns_data(
        self, mock_db, mock_preference, user_id
    ):
        """Preference tồn tại → trả về data."""
        mock_db.query.return_value = build_query_chain(first=mock_preference)

        result = PreferenceService.get_my_preferences(mock_db, user_id)

        assert result["success"] is True
        assert result["data"] == mock_preference

    def test_no_preference_returns_none_data(self, mock_db, user_id):
        """Preference không tồn tại → KHÔNG raise 404, trả về data=None."""
        mock_db.query.return_value = build_query_chain(first=None)

        result = PreferenceService.get_my_preferences(mock_db, user_id)

        assert result["success"] is True
        assert result["data"] is None

    def test_message_is_correct_when_no_preference(
        self, mock_db, user_id
    ):
        """Không có preference → message vẫn thành công."""
        mock_db.query.return_value = build_query_chain(first=None)

        result = PreferenceService.get_my_preferences(mock_db, user_id)

        assert result["message"] == "User preferences retrieved successfully"


# UPDATE MY PREFERENCES


class TestUpdateMyPreferences:

    def test_existing_preference_updates_fields(
        self, mock_db, mock_preference, user_id
    ):
        """Preference tồn tại → update fields, db.add() KHÔNG gọi."""
        mock_db.query.return_value = build_query_chain(first=mock_preference)
        mock_db.refresh.side_effect = lambda obj: None

        data = UpdateUserPreferenceRequest(skin_type="da khô")
        result = PreferenceService.update_my_preferences(
            mock_db, user_id, data)

        assert result["success"] is True
        assert mock_preference.skin_type == "da khô"
        mock_db.commit.assert_called_once()
        mock_db.add.assert_not_called()

    def test_no_preference_creates_new_one(self, mock_db, user_id):
        """Preference không tồn tại → tạo mới (upsert), db.add() được gọi."""
        new_pref = MagicMock()
        new_pref.id = str(__import__("uuid").uuid4())
        mock_db.query.return_value = build_query_chain(first=None)
        mock_db.refresh.side_effect = lambda obj: None

        data = UpdateUserPreferenceRequest(skin_type="da thường")
        PreferenceService.update_my_preferences(mock_db, user_id, data)

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_only_provided_fields_are_updated(
        self, mock_db, mock_preference, user_id
    ):
        """Chỉ field được truyền mới bị update."""
        original_concerns = mock_preference.skin_concerns
        mock_db.query.return_value = build_query_chain(first=mock_preference)
        mock_db.refresh.side_effect = lambda obj: None

        data = UpdateUserPreferenceRequest(skin_type="da hỗn hợp")
        PreferenceService.update_my_preferences(mock_db, user_id, data)

        assert mock_preference.skin_type == "da hỗn hợp"
        assert mock_preference.skin_concerns == original_concerns  # không thay đổi

    def test_message_is_update_success(
        self, mock_db, mock_preference, user_id
    ):
        """Message phải là update success."""
        mock_db.query.return_value = build_query_chain(first=mock_preference)
        mock_db.refresh.side_effect = lambda obj: None

        data = UpdateUserPreferenceRequest(skin_type="da dầu")
        result = PreferenceService.update_my_preferences(
            mock_db, user_id, data)

        assert "updated" in result["message"].lower() or \
               result["message"] == "User preferences updated successfully"
