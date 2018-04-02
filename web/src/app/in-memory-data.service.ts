import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDataService {
  createDb() {
    // we're not typing it as we did with the mod-uploads as it's faking plain JSON
    // export const UPLOADS: Upload[] = [...]
    const uploads = [
      { id: 'File0.jpg', bucket: 'bucket0', size: 0, etag: '0000', comment: 'comment0' },
      { id: 'File1.jpg', bucket: 'bucket1', size: 1, etag: '1111', comment: 'comment1' },
      { id: 'File2.jpg', bucket: 'bucket2', size: 2, etag: '2222', comment: 'comment2' },
      { id: 'File3.jpg', bucket: 'bucket3', size: 3, etag: '3333', comment: 'comment3' },
      { id: 'File4.jpg', bucket: 'bucket4', size: 4, etag: '4444', comment: 'comment4' },
      { id: 'File5.jpg', bucket: 'bucket5', size: 5, etag: '5555', comment: 'comment5' },
      { id: 'File6.jpg', bucket: 'bucket6', size: 6, etag: '6666', comment: 'comment6' },
      { id: 'File7.jpg', bucket: 'bucket7', size: 7, etag: '7777', comment: 'comment7' },
      { id: 'File8.jpg', bucket: 'bucket8', size: 8, etag: '8888', comment: 'comment8' },
      { id: 'File9.jpg', bucket: 'bucket9', size: 9, etag: '9999', comment: 'comment9' },
    ];
    return { uploads };           // why is this wrapped in braces?
  }
}
