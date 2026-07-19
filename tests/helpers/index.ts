// Auth helpers
export { login, logout, registerUser, adminLogin } from "./auth";

// Navigation helpers
export {
  navigateTo,
  navigateToDashboard,
  navigateToUpload,
  navigateToProfile,
  navigateToSettings,
  navigateToReport,
  navigateToAdmin,
  navigateToReview,
  navigateToReportDetail,
  navigateToMyReports,
  navigateToGallery,
  navigateToVerify,
} from "./navigation";

// Upload helpers
export {
  uploadArtwork,
  fillArtworkForm,
  selectArtworkFile,
  submitArtwork,
} from "./upload";

// Report helpers
export { submitReport, viewMyReports, viewReportDetail } from "./reports";

// Admin helpers
export {
  navigateToAdminDashboard,
  navigateToVerificationQueue,
  navigateToAdminReports,
  navigateToUserManagement,
  approveArtwork,
  rejectArtwork,
  assignReportToAdmin,
  banUser,
  suspendUser,
  warnUser,
} from "./admin";

// Notification helpers
export {
  openNotifications,
  getUnreadCount,
  clickNotification,
  markAllNotificationsAsRead,
} from "./notifications";

// Wait helpers
export {
  waitForPlagiarismScan,
  waitForBlockchainRegistration,
  waitForUploadComplete,
  waitForToast,
  waitForLoadingToFinish,
  waitForText,
  waitForNavigation,
  waitForTableData,
  waitForDialog,
  waitForDialogToClose,
} from "./wait-for";