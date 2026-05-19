import { isGoogleAuthEnabled, getCustomerGoogleAuthUrl } from '../../lib/googleAuth'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5-3.1 0-5.6-2.6-5.6-5.8S8.9 5.7 12 5.7c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 3.2 14.6 2.3 12 2.3 6.9 2.3 2.8 6.4 2.8 11.5S6.9 20.7 12 20.7c6.9 0 8.5-4.8 8.5-7.3 0-.5 0-.9-.1-1.2H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.4 6.5 9.3c.7-1.7 2.4-3.6 5.5-3.6 1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 3.2 14.6 2.3 12 2.3 8.5 2.3 5.6 4.5 4.2 7.4z"
      />
      <path
        fill="#4A90E2"
        d="M12 20.7c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.3 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5.1L3.9 13c1.4 3.9 5.3 7.7 8.1 7.7z"
      />
      <path
        fill="#FBBC05"
        d="M20.8 13.1c.1-.5.2-1 .2-1.6 0-.6-.1-1.1-.2-1.6H12v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5-.8 0-1.5-.2-2.1-.5l-3.7 2.9c1.4 1.1 3.2 1.8 5.8 1.8 3.5 0 6.5-2.3 7.6-5.7z"
      />
    </svg>
  )
}

export default function CustomerGoogleAuthButton({ returnPath = '/account', disabled = false, label }) {
  if (!isGoogleAuthEnabled()) {
    return null
  }

  const handleClick = () => {
    window.location.href = getCustomerGoogleAuthUrl(returnPath)
  }

  return (
    <button
      className="cart-google-auth-button"
      type="button"
      disabled={disabled}
      onClick={handleClick}
    >
      <GoogleIcon />
      <span>{label}</span>
    </button>
  )
}
