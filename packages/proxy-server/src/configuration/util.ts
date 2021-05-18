export const isObject = oTarget =>
  Object.prototype.toString.call(oTarget).replace(/^.*\s(.*)]$/, '$1') ===
  'Object';

export const isString = oTarget =>
  Object.prototype.toString.call(oTarget).replace(/^.*\s(.*)]$/, '$1') ===
  'String';

export const isJSON = target => {
  const _target = isObject(target) ? JSON.stringify(target) : target;

  if (isString(_target)) {
    try {
      JSON.parse(_target);
    } catch (e) {
      return false;
    }
    return true;
  }
  return false;
};

export const separatter = Symbol('@@sep');

export const CACHE_STRATEGY = {
  'No Cache': 0,
  'Only Cache': 1,
  'Remote First': 2,
  'Cache First': 3,
} as const;
