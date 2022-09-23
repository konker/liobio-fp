import f23_json from './files/sub2/f23.json';

export const AWS_REGION = 'eu-north-1';
export const TEST_S3_BUCKET = 'mws-test-bucket';

export const TEST_JSON_O = f23_json;
export const TEST_JSON_S = JSON.stringify(TEST_JSON_O);
export const TEST_CSV_S = [
  '"h1","h2","h3"',
  '"r11","r12","r13"',
  '"r21","r22","r23"',
  '"r31","r32","r33"',
  '"r41","r42","r43"\n',
].join('\n');
export const TEST_CSV_S_LINE = '"h1","h2","h3"';
export const TEST_CSV_AS = [
  ['h1', 'h2', 'h3'],
  ['r11', 'r12', 'r13'],
  ['r21', 'r22', 'r23'],
  ['r31', 'r32', 'r33'],
  ['r41', 'r42', 'r43'],
];
export const TEST_CSV_OS = [
  { h1: 'r11', h2: 'r12', h3: 'r13' },
  { h1: 'r21', h2: 'r22', h3: 'r23' },
  { h1: 'r31', h2: 'r32', h3: 'r33' },
  { h1: 'r41', h2: 'r42', h3: 'r43' },
];

export const TEST_NDJSON_S = [
  '{"foo":1,"bar":2}',
  '{"foo":11,"bar":22}',
  '{"foo":111,"bar":222}',
  '{"foo":1111,"bar":2222}\n',
].join('\n');
export const TEST_NDJSON_S_LINE = '{ "foo":  1, "bar": 2 }';
export const TEST_NDJSON_OS = [
  { foo: 1, bar: 2 },
  { foo: 11, bar: 22 },
  { foo: 111, bar: 222 },
  { foo: 1111, bar: 2222 },
];
