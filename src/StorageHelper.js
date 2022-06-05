function storePrefs(action, data) {
  try {
    const key = `preferences_${action}`;
    const prefsJSONStr = JSON.stringify(data);
    localStorage.setItem(key, prefsJSONStr);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

function retrievePrefs(action) {
  const key = `preferences_${action}`;
  const prefsJSONStr = localStorage.getItem(key);
  try {
    const prefs = JSON.parse(prefsJSONStr);
    return { data: prefs };
  } catch (err) {
    return { data: null, error: err };
  }
}

export default {
  storePrefs,
  retrievePrefs,
};
