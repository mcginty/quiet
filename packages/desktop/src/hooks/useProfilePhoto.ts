import { useSelector } from 'react-redux'
import { files } from '@quiet/state-manager'
import { UserProfile, DownloadState } from '@quiet/types'

/**
 * Hook to get the appropriate profile photo source for a user
 * Handles IPFS photos, legacy base64 photos, and download states
 */
export const useProfilePhoto = (userProfile?: UserProfile) => {
  const downloadStatuses = useSelector(files.selectors.downloadStatuses)

  if (!userProfile) {
    return {
      photoSrc: null,
      isLoading: false,
      useJdenticon: true,
    }
  }

  // Check if user has IPFS photo
  if (userProfile.photoFile && userProfile.photoFile.cid) {
    const messageId = userProfile.photoFile.message.id
    const downloadStatus = downloadStatuses[messageId]

    // Photo is being downloaded
    if (
      downloadStatus?.downloadState === DownloadState.Queued ||
      downloadStatus?.downloadState === DownloadState.Downloading
    ) {
      return {
        photoSrc: userProfile.photo || null, // Fall back to base64 if available during download
        isLoading: true,
        useJdenticon: !userProfile.photo,
      }
    }

    // Photo download completed - use local file path
    if (downloadStatus?.downloadState === DownloadState.Completed && userProfile.photoFile.path) {
      const fileProtocol = 'file://'
      const photoPath = userProfile.photoFile.path.startsWith(fileProtocol)
        ? userProfile.photoFile.path
        : `${fileProtocol}${userProfile.photoFile.path}`

      return {
        photoSrc: photoPath,
        isLoading: false,
        useJdenticon: false,
      }
    }

    // Photo exists but not downloaded yet, or download failed
    // Fall back to base64 photo if available
    if (userProfile.photo) {
      return {
        photoSrc: userProfile.photo,
        isLoading: false,
        useJdenticon: false,
      }
    }

    // IPFS photo exists but not downloaded and no base64 fallback
    return {
      photoSrc: null,
      isLoading: false,
      useJdenticon: true,
    }
  }

  // Legacy base64 photo (no IPFS photo)
  if (userProfile.photo) {
    return {
      photoSrc: userProfile.photo,
      isLoading: false,
      useJdenticon: false,
    }
  }

  // No photo at all
  return {
    photoSrc: null,
    isLoading: false,
    useJdenticon: true,
  }
}
