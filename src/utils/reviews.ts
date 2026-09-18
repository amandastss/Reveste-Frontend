type ReviewOwnerReference = {
  id?: number | string | null
  userId?: number | string | null
  user_id?: number | string | null
  email?: string | null
  userName?: string | null
  user_name?: string | null
  username?: string | null
  userAvatar?: string | null
  profile_image?: string | null
  photo?: string | null
  avatar?: string | null
  image?: string | null
  name?: string | null
  user?: {
    id?: number | string | null
    userId?: number | string | null
    user_id?: number | string | null
    email?: string | null
    name?: string | null
    username?: string | null
    profile_image?: string | null
    photo?: string | null
    avatar?: string | null
    image?: string | null
  } | null
  author?: {
    id?: number | string | null
    email?: string | null
    name?: string | null
    username?: string | null
    profile_image?: string | null
    photo?: string | null
    avatar?: string | null
    image?: string | null
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

    const user = JSON.parse(rawUser) as {
      name?: string | null
      username?: string | null
      profile_image?: string | null
      photo?: string | null
      avatar?: string | null
      image?: string | null
    }

    const name =
      typeof user.name === 'string' && user.name.trim()
        ? user.name.trim()
        : typeof user.username === 'string' && user.username.trim()
          ? user.username.trim()
          : null

    const avatar =
      typeof user.profile_image === 'string' && user.profile_image.trim()
        ? user.profile_image.trim()
        : typeof user.photo === 'string' && user.photo.trim()
          ? user.photo.trim()
          : typeof user.avatar === 'string' && user.avatar.trim()
            ? user.avatar.trim()
            : typeof user.image === 'string' && user.image.trim()
              ? user.image.trim()
              : null

    return { name, avatar }
  } catch {
    return { name: null, avatar: null }
  }
}

export function canDeleteReview(
  review: ReviewOwnerReference | null | undefined,
  currentUserId: number | null = getLoggedUserId(),
): boolean {
  if (!review) {
    return false
  }

  const reviewOwnerIds = [
    review.userId,
    review.user_id,
    review.user?.id,
    review.user?.userId,
    review.user?.user_id,
    review.author?.id,
  ]

  const normalizedIds = reviewOwnerIds
    .map((value) => normalizeId(value))
    .filter((value): value is number => value !== null)

  if (currentUserId !== null && normalizedIds.includes(currentUserId)) {
    return true
  }

  const currentUser = getLoggedUserProfileData()
  const reviewNames = [
    review.name,
    review.username,
    review.userName,
    review.user_name,
    review.user?.name,
    review.user?.username,
    review.author?.name,
    review.author?.username,
  ]

  const sameName = reviewNames
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .some((name) => name.trim() === currentUser.name)

  const currentUserEmail = getLoggedUserEmail()
  if (!currentUserEmail) {
    return sameName
  }

  const reviewEmails = [review.email, review.user?.email, review.author?.email]

  return (
    reviewEmails
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .some((email) => email.toLowerCase() === currentUserEmail) || sameName
  )
}
