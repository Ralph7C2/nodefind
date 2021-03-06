# nodefind

# Install

Install as a globally available binary with `npm i -g`

## Usage

```
nodefind [options] <dir>

Lists all the files and subdirectories in dir recursively, if dir is omitted, the current dir is used
```

### Options

`-n, --name <pattern>`
Uses glob pattern matching to filter the files returned

`-r, --regex <pattern>`
Uses regex to filter the returned files

**If both of the above flags are specified, it works as an AND, and only returns files that match both patterns**

`-e, --empty`
Only returns empty files

`-m, --maxdepth <depth>`
Only recurses to `depth` level of subdirectories

`-p, --print0`
Prints as null separated string, rather than with new lines

`--delete`
Deletes the files returned by the search

`--delete-silent`
Silently deletes the files returned by the search

`-h, --help`
Prints the help information, basically what is included here
