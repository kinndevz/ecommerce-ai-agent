import unittest

from app.routes.wishlist import router as wishlist_router
from app.routes.reviews import router as reviews_router
from app.routes.analytics import router as analytics_router


class TestRoutesSmoke(unittest.TestCase):
    def _paths(self, router):
        return {route.path for route in router.routes if hasattr(route, "path")}

    def test_wishlist_routes(self):
        paths = self._paths(wishlist_router)
        self.assertIn("/wishlist", paths)
        self.assertIn("/wishlist/{product_id}", paths)

    def test_reviews_routes(self):
        paths = self._paths(reviews_router)
        self.assertIn("/products/{product_id}/reviews", paths)
        self.assertIn("/products/{product_id}/rating-summary", paths)
        self.assertIn("/reviews/{review_id}", paths)

    def test_analytics_routes(self):
        paths = self._paths(analytics_router)
        self.assertIn("/admin/analytics/summary", paths)
        self.assertIn("/admin/analytics/trend", paths)
        self.assertIn("/admin/analytics/top-products", paths)


if __name__ == "__main__":
    unittest.main()
