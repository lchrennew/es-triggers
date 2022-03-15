set -v
mkdir /es-triggers
cd /es-triggers || exit
mv /package.json .
echo "" > .env
yarn
rm -rf /build.sh
