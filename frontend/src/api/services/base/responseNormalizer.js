/**
 * Pure helper: normalizes the three response shapes BaseApiService.getAll may receive
 * into the canonical { data, pagination } envelope.
 */

/**
 * @param {*} response
 * @param {number} page
 * @param {number} limit
 * @returns {{ data: Array, pagination: Object } | *}
 */
export function normalizeGetAllResponse(response, page, limit) {
  if (response && typeof response === 'object') {
    if ('data' in response && 'pagination' in response) {
      return response;
    }
    if (Array.isArray(response)) {
      return {
        data: response,
        pagination: {
          page,
          limit,
          total: response.length,
          pages: 1,
          has_next: false,
          has_prev: false,
        },
      };
    }
  }
  return response;
}
