## lib/io

A general-purpose library for performing file input/output operations.

Currently, this supports the following features:

- Local filesystem support
- S3 support
- File read streaming for memory efficiency when dealing with large files
- CSV data format reading and writing
- JSON data format reading and writing
- [NDJSON](http://ndjson.org/) data format reading and writing
- Reading of filesystem trees
    - pluggable crawling strategies (DepthFirstTreeCrawler currently implemented)
    - pluggable filtering modules, independently configurable for file and directories
    - pluggable handler modules for dealing with crawler output, independently configurable for files and directories
    - pre-configured tree readers for common data formats, e.g.
        - JsonFileTreeReader
        - CsvFileTreeReader
