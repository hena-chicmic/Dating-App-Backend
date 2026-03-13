const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");


router.use(authMiddleware);



// Get the logged-in user's own profile (includes bio, preferences, height, location)
router.get("/profile", userController.getMyProfile);

// Update the logged-in user's profile
router.put("/profile", userController.updateMyProfile);

// Get all media for the logged-in user
router.get("/media", userController.getMyMedia);

// Upload a new photo/video
router.post("/media", userController.uploadMedia);

// Delete a specific photo/video
router.delete("/media/:mediaId", userController.deleteMedia);

// Set a specific media item as the primary profile picture
router.put("/media/:mediaId/primary", userController.setPrimaryMedia);

// Get the master list of all available interests
router.get("/interests", userController.getAllInterests);

// Get all interests selected by the logged-in user
router.get("/my-interests", userController.getMyInterests);

// Update/Set the list of interests for the user
router.put("/my-interests", userController.updateMyInterests);

router.get("/:targetUserId", userController.getUserProfile);

router.post("/deactivate", userController.deactivateAccount);

router.delete("/account", userController.deleteAccount);


module.exports = router;
