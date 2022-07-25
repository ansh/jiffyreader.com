ext_version_name=1-beta
echo $ext_version_name
ext_version_id=$(echo $ext_version_name | tr -d [:alpha:] | tr -d [=-=])
ext_tag=$(echo $ext_version_name | tr -d [:digit:] | tr -d [=-=] | tr -d [=.=])
echo "build jiffy-reader-development"
printf "VERSION=$ext_version_id \nNAME=\"Jiffy Reader $ext_tag\" \nTARGET=chrome \nDEBUG=FALSE" > .env.production
pnpm gh:build:development
zip build/jiffyReader-chrome-$ext_tag -j build/chrome-mv3-prod/*