"use strict";
(() => {
  const AP = window.AutoParts;
  const key = "autoparts-final-requests-v1";
  const statuses = ["draft", "ready", "sent"];
  function errorFor(value) {
    if (!value || !AP.getProduct(value.productId)) return "Choose an available catalog part.";
    if (!Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 99) return "Enter a whole quantity from 1 to 99.";
    if (typeof value.note !== "string" || value.note.trim().length > 200) return "Use a note of no more than 200 characters.";
    if (!statuses.includes(value.status)) return "Choose an available status.";
    return "";
  }
  function sanitize(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.filter(record => {
      if (!record || typeof record.id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(record.id) || seen.has(record.id) || errorFor(record) || typeof record.createdAt !== "string" || !Number.isFinite(Date.parse(record.createdAt))) return false;
      seen.add(record.id);
      return true;
    }).map(record => ({ id: record.id, productId: record.productId, quantity: record.quantity, note: record.note.trim(), status: record.status, createdAt: record.createdAt }));
  }
  let records = sanitize(AP.storage.read(key, []));
  function save() {
    AP.storage.write(key, records);
    document.dispatchEvent(new CustomEvent("requests:change"));
  }
  AP.requests = {
    errorFor, sanitize,
    list: () => records.map(record => ({ ...record })),
    create(value) {
      const error = errorFor(value);
      if (error) throw new Error(error);
      const id = window.crypto.randomUUID();
      const record = { id, productId: value.productId, quantity: value.quantity, note: value.note.trim(), status: value.status, createdAt: new Date().toISOString() };
      records.unshift(record);
      save();
      return { ...record };
    },
    update(id, value) {
      const record = records.find(item => item.id === id);
      if (!record) throw new Error("This request no longer exists.");
      const error = errorFor(value);
      if (error) throw new Error(error);
      Object.assign(record, { productId: value.productId, quantity: value.quantity, note: value.note.trim(), status: value.status });
      save();
    },
    remove(id) {
      records = records.filter(record => record.id !== id);
      save();
    }
  };
})();
