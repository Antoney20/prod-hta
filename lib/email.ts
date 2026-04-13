export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email is required'
  }

  const trimmed = email.trim()

  const regex = /^[a-z0-9]+([._+-]?[a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i

  if (!regex.test(trimmed)) {
    return 'Please enter a valid email address'
  }

  if (trimmed.includes('..')) {
    return 'Email cannot contain consecutive dots'
  }

  if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return 'Email cannot start or end with a dot'
  }

  return null
}