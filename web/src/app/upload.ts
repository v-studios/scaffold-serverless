// We really should use an opaque UUID for ID, created in a constructor;
// then use `key` for the S3 key, which is the filenname.

export class Upload {
  id: string;
  bucket: string;
  size: number;
  etag: string
  comment: string;
}

