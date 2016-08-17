# BROIL
###### Use broil to generate all the files/folders in your projects for you, each scaffold is based off a simple .json file allowing for easy sharing
#
### Install
`npm install -g broil`

### Command Line Usage
`broil [--add] [--gen] [--no-content] scaffold`

# Examples:
#### Basic Usage
###### This will copy an old project into scaffolds/scaffoldName.json, allowing you to build a scaffold in any other folder at any time
#
```DOS
cd myOldProject
broil --gen scaffoldName
mkdir myNewProject
cd myNewProject
broil scaffoldName
```
#
#### Create scaffold with no content in files
```DOS
mkdir myNewProject
cd myNewProject
broil --no-content scaffoldName
```
#### Add existing scaffold.json file to the global path for later use
```DOS
cd pathContainingScaffold
broil --add scaffold.json
```


### scaffold JSON layout
```json
{
    "files": {
        "firstFile.ext": {
            "content": "Hello %%planet%%!"
        },
        "folder": {
            "files": {
                "secondFile.ext": {
                    "content": "Prompted Var: %%prm%%"
                }
            }
        }
    },
    "vars": {
        "planet": {
            "content": "Earth"
        },
        "prm": {
            "prompt": "Input: " 
        }
    }
}
```

# TODO:
- Complete DOCS
- add tests
- ensure cross-platform support

