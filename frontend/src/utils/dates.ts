export const today = () => new Date().toISOString().slice(0, 10);

export const isPastDate = (value?: string) => Boolean(value && value < today());

export const toDateInput = (value?: string) => (value ? value.slice(0, 10) : '');

export const futureDateOrEmpty = (value?: string) => {
  const normalized = toDateInput(value);
  return normalized && !isPastDate(normalized) ? normalized : '';
};
