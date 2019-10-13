module.exports = function filterPriority (entry, priority, defaultPriority = 3) {
  if (entry.hidePriority <= priority) {
    return false
  }

  if ((entry.priority || defaultPriority) <= priority) {
    return true
  }

  return false
}
