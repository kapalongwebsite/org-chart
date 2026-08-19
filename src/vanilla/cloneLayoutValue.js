/**
 * Copy a serializable layout value without retaining references to the host.
 *
 * Vue exposes nested prop values as Proxy objects. Browsers provide
 * structuredClone(), but it rejects those proxies with DataCloneError. The
 * layout contract is JSON-serializable already (it is also sent to a Web
 * Worker and persisted as JSON), so fall back to a JSON copy when the native
 * clone cannot handle a framework wrapper.
 */
export function cloneLayoutValue(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // Continue to the serializable fallback below.
    }
  }
  return JSON.parse(JSON.stringify(value));
}
