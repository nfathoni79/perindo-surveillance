/**
 * Format date time string to Indonesian locale.
 * @param {string} dateTimeString date time string.
 */
const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toLocaleString(
    'id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

export {
  formatDateTime,
}