const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const isAuthenticated = require("../middleware/auth.middleware");
const validate = require('../middleware/validation.middleware');
const { updateProfileSchema, updatePreferencesSchema, updateInterestsSchema, mediaIdParamSchema, targetUserIdParamSchema } = require('../validations/user.validation');
const upload = require("../middleware/multer.middleware");

router.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and media operations
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 */
router.get("/profile", userController.getMyProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               gender:
 *                 type: string
 *                 enum: [male, female, non-binary, other]
 *               interested_in:
 *                 type: string
 *                 enum: [male, female, non-binary, everyone]
 *               min_preferred_age:
 *                 type: integer
 *               max_preferred_age:
 *                 type: integer
 *               height:
 *                 type: number
 *                 minimum: 50
 *                 maximum: 300
 *               location_city:
 *                 type: string
 *                 maxLength: 100
 *               location_country:
 *                 type: string
 *                 maxLength: 100
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *     responses:
 *       200:
 *         description: Successfully updated profile
 *       400:
 *         description: Validation error
 */
router.put("/profile", validate(updateProfileSchema), userController.updateMyProfile);

/**
 * @swagger
 * /users/media:
 *   get:
 *     summary: Get all user media
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user media
 */
router.get("/media", userController.getMyMedia);

/**
 * @swagger
 * /users/media:
 *   post:
 *     summary: Upload new media
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 */
router.post("/media", upload.single('media'), userController.uploadMedia);

/**
 * @swagger
 * /users/media/{mediaId}:
 *   delete:
 *     summary: Delete specific media
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media deleted successfully
 */
router.delete("/media/:mediaId", validate(mediaIdParamSchema, 'params'), userController.deleteMedia);

/**
 * @swagger
 * /users/media/{mediaId}/primary:
 *   put:
 *     summary: Set media as primary profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Set as primary successfully
 */
router.put("/media/:mediaId/primary", validate(mediaIdParamSchema, 'params'), userController.setPrimaryMedia);

/**
 * @swagger
 * /users/interests:
 *   get:
 *     summary: Get all available master interests
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Master list of interests
 */
router.get("/interests", userController.getAllInterests);

/**
 * @swagger
 * /users/my-interests:
 *   get:
 *     summary: Get current user's selected interests
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's interests retrieved
 */
router.get("/my-interests", userController.getMyInterests);

/**
 * @swagger
 * /users/my-interests:
 *   put:
 *     summary: Update user's interests
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interestIds
 *             properties:
 *               interestIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Interests updated
 */
router.put("/my-interests", validate(updateInterestsSchema), userController.updateMyInterests);

/**
 * @swagger
 * /users/{targetUserId}:
 *   get:
 *     summary: Get another user's public profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile retrieved
 */
router.get("/:targetUserId", validate(targetUserIdParamSchema, 'params'), userController.getUserProfile);

/**
 * @swagger
 * /users/deactivate:
 *   post:
 *     summary: Deactivate account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated
 */
router.post("/deactivate", userController.deactivateAccount);

/**
 * @swagger
 * /users/account:
 *   delete:
 *     summary: Delete account permanently
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete("/account", userController.deleteAccount);


module.exports = router;
