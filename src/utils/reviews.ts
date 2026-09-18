type ReviewOwnerReference = {
  id?: number | string | null
  userId?: number | string | null
  user_id?: number | string | null
  email?: string | null
  userName?: string | null
  user_name?: string | null
  userAvatar?: string | null
  profile_image?: string | null
  name?: string | null
  user?: {
    id?: number | string | null
    userId?: number | string | null
    user_id?: number | string | null
    email?: string | null
    name?: string | null
    profile_image?: string | null
  } | null
  author?: {
    id?: number | string | null
    email?: string | null
    name?: string | null
    profile_image?: string | null
  } | null
}

export function normalizeId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

export function getLoggedUserId(): number | null {
  if (typeof localStorage === 'undefined') {
    return null
  }

  try {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) {
      return null
    }

    const user = JSON.parse(rawUser) as { id?: unknown; userId?: unknown; user_id?: unknown }
    return normalizeId(user.id ?? user.userId ?? user.user_id)
  } catch {
    return null
  }
}

export function getLoggedUserEmail(): string | null {
  if (typeof localStorage === 'undefined') {
    return null
  }

  try {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) {
      return null
    }

    const user = JSON.parse(rawUser) as { email?: string | null }
    return typeof user.email === 'string' ? user.email.toLowerCase() : null
  } catch {
    return null
  }
}

export function getLoggedUserProfileData(): { name: string | null; avatar: string | null } {
  if (typeof localStorage === 'undefined') {
    return { name: null, avatar: null }
  }

  try {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) {
      return { name: null, avatar: null }
    }

    const user = JSON.parse(rawUser) as { name?: string | null; profile_image?: string | null }
    return {
      name: typeof user.name === 'string' ? user.name.trim() : null,
      avatar: typeof user.profile_image === 'string' ? user.profile_image.trim() : null
    }
  } catch {
    return { name: null, avatar: null }
  }
}

export function canDeleteReview(
  review: ReviewOwnerReference | null | undefined,
  currentUserId: number | null = getLoggedUserId()
): boolean {
  if (!review || currentUserId === null) {
    return false
  }

  const reviewOwnerIds = [
    review.userId,
    review.user_id,
    review.user?.id,
    review.user?.userId,
    review.user?.user_id,
    review.author?.id
  ]

  const normalizedIds = reviewOwnerIds
    .map((value) => normalizeId(value))
    .filter((value): value is number => value !== null)

  if (normalizedIds.includes(currentUserId)) {
    return true
  }

  const currentUser = getLoggedUserProfileData()
  const reviewNames = [
    review.name,
    review.userName,
    review.user_name,
    review.user?.name,
    review.author?.name
  ]
  const reviewAvatars = [
    review.userAvatar,
    review.profile_image,
    review.user?.profile_image,
    review.author?.profile_image
  ]

  const sameName = reviewNames
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .some((name) => name.trim() === currentUser.name)

  const sameAvatar = reviewAvatars
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .some((avatar) => avatar === currentUser.avatar)

  if (sameName || sameAvatar) {
    return true
  }

  const currentUserEmail = getLoggedUserEmail()
  if (!currentUserEmail) {
    return false
  }

  const reviewEmails = [
    review.email,
    review.user?.email,
    review.author?.email
  ]

  return reviewEmails
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .some((email) => email.toLowerCase() === currentUserEmail)
}
