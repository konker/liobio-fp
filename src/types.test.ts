import * as unit from './types';
import { FileType } from './types';

describe('DataAccessor', () => {
  describe('fileTypeIsDirectory', () => {
    it('should work as expected', () => {
      expect(unit.fileTypeIsDirectory(FileType.Directory)).toBe(true);
      expect(unit.fileTypeIsDirectory(FileType.File)).toBe(false);
      expect(unit.fileTypeIsDirectory(FileType.Other)).toBe(false);
    });
  });

  describe('fileTypeIsFile', () => {
    it('should work as expected', () => {
      expect(unit.fileTypeIsFile(FileType.Directory)).toBe(false);
      expect(unit.fileTypeIsFile(FileType.File)).toBe(true);
      expect(unit.fileTypeIsFile(FileType.Other)).toBe(false);
    });
  });

  describe('fileTypeIsOther', () => {
    it('should work as expected', () => {
      expect(unit.fileTypeIsOther(FileType.Directory)).toBe(false);
      expect(unit.fileTypeIsOther(FileType.File)).toBe(false);
      expect(unit.fileTypeIsOther(FileType.Other)).toBe(true);
    });
  });
});
