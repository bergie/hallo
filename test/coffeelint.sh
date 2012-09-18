find src -name "*.coffee" | while read FILE; do
  echo "Linting $FILE"
  coffeelint "$FILE"
done;
