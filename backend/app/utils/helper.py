def match_path(pattern: str, actual: str) -> bool:
    """
    Match path pattern with actual path

    Examples:
        pattern: "/users/{user_id}"
        actual: "/users/123"
        → True

        pattern: "/products/{product_id}/reviews"
        actual: "/products/abc-123/reviews"
        → True
    """
    pattern_parts = pattern.split('/')
    actual_parts = actual.split('/')

    if len(pattern_parts) != len(actual_parts):
        return False

    for pattern_part, actual_part in zip(pattern_parts, actual_parts):
        if pattern_part.startswith('{') and pattern_part.endswith('}'):
            continue

        if pattern_part != actual_part:
            return False
    return True
