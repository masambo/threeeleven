export function getClerkError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray(error.errors) &&
    error.errors[0]?.message
  ) {
    return error.errors[0].message;
  }

  return 'Please check your details and try again.';
}
