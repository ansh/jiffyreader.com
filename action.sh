#!/bin/bash

appRoot="$(pwd)"
# take tag name as args

goToAppRoot(){
    cd "$appRoot"
}


printMsg(){
    msg=$1
    echo ">>> $msg"
}

getVersion(){
    # input: "version-scope"
    tag=$1
    version=${tag%%-development}
    echo $version
}

getScope(){
    tag=$1
    # 10-development
    suffix="$2"
    scope_raw="${tag#${suffix}}"
    scope="${scope_raw//-/}"
    echo $scope
}

buildEnv(){
    version="$(getVersion $1)"
    scope=$2
    fullTag=$3
    echo "version: $version"
    echo "scope: $scope"
    echo "name: $fullTag"

    # printf "VERSION=$version\nNAME=\"Jiffy Reader$scope\"\nTARGET=chrome\nDEBUG=FALSE\nSHORTCUT=Alt+B\nVERSION_NAME=$fullTag" > .env.production
}


zipPacks(){
    scope=$1
    cd build/chrome-mv3-prod/ && zip -r "../jiffyReader-chrome$scope" ./*
    goToAppRoot
    cd build/firefox-mv2-prod/ && zip -r "../jiffyReader-firefox$scope.xpi" ./*
    goToAppRoot
    printMsg "zipPacks complete $(ls build/ -l)"
}



buildDevelopment(){
    printMsg "buildDevelopment:started"
    fullname="$1-development"
    buildEnv $1 " Dev" $fullname
    pnpm gh:build:development && pnpm gh:build:bookmarklet && pnpm gh:build:firefox
    printMsg "buildDevelopment:complete"
    zipPacks "-development"
}

buildRelease(){
    fullname="$1"
    buildEnv $1 "" $fullname
    pnpm gh:build:chrome && pnpm gh:build:firefox && pnpm gh:build:bookmarklet
    zipPacks ""
}

handle(){
    tag=$1
    buildDevelopment $tag 
    buildRelease $tag
}

cleanBuildDirectory(){
    rm -rf build/
}


tag=$1
cleanBuildDirectory

# tags= value in bump.txt if not set
handle "${tag:=$(cat bump.txt)}"