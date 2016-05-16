#!/bin/bash

# vault.sh - by Seandon Mooy

# Used to encrypt / decrypt secret files with AES-256-CBC
# This script it means to be generic and wrap all other secreting systems
# such as ansible-vault, chef data bags, or just plain-jane secrets of any type
# To use, you'll need a '.secret' file, which is simply a password

USAGE="Usage: ./bin/vault.sh <encrypt|decrypt|upload|edit|rekey> secrets/file"

SECRET_DIR=${SECRET_DIR:-.}
EDITOR=${EDITOR:-vim}
SECRET_FILE=${SECRET_FILE:-.secret}
# Extension of encrypted files
VAULTED_EXT='.secret'
# Extension of plaintext files (ADD *.$PLAIN_EXT to .gitignore, or you've destroyed the purpose of this tool!)
PLAIN_EXT='.plain'

if ! [ -f ${SECRET_FILE} ]; then
  echo -e "You're missing a ${SECRET_FILE} file! Exiting!"
  exit
elif [[ "${1}" != "setup" ]] && ! [ -f "${2}" ]; then
  echo ${USAGE}
  exit
fi

function encrypt {
  openssl enc -aes-256-cbc -a -salt -in ${1} -pass file:${SECRET_FILE}
}
function decrypt {
  openssl enc -d -aes-256-cbc -a -in ${1} -pass file:${SECRET_FILE}
}
function rename {
  echo ${1} | sed -i "s/${VAULTED_EXT}/${PLAIN_EXT}"
}
function validate {
  if [[ "$(echo ${1} | fgrep '.json')" == "${1}" ]]; then
    if [ -x "$(command -v ./node_modules/.bin/jsonlint)" ]; then
      ./node_modules/.bin/jsonlint ${1} > /dev/null
      if [[ $? != 0 ]]; then
        echo "Warning: Not valid JSON! Savings anyways."
      fi
    else
      echo "Notice: jsonlint is not installed - cannot validate json. Use `sudo npm install -g jsonlint`"
    fi
  fi
}

if [[ "${1}" == "decrypt" ]]; then
  decrypt ${2}
elif [[ "${1}" == "encrypt" ]]; then
  encrypt ${2}
elif [[ "${1}" == "rekey" ]]; then
  if [ -f "${3}" ]; then
    decrypt ${2} > ${2}${PLAIN_EXT}
    SECRET_FILE=${3}
    encrypt ${2}${PLAIN_EXT} > ${2}
    rm ${2}${PLAIN_EXT}
  else
    echo "Usage: ./bin/vault.sh rekey secret/file /path/to/new.secret"
    exit
  fi
elif [[ "${1}" == "edit" ]]; then
  decrypt ${2} > ${2}${PLAIN_EXT}
  $EDITOR ${2}${PLAIN_EXT}
  validate ${2}${PLAIN_EXT}
  encrypt ${2}${PLAIN_EXT} > ${2}
  rm ${2}${PLAIN_EXT}
else
  echo ${USAGE}
fi
