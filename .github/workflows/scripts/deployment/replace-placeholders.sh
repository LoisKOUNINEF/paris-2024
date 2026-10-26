#!/bin/bash

replace_placeholders() {
  echo "Checking for missing image tags to update"

  if [ "$STACK_NAME" = "staging" ]; then
    origin="prev-staging.yml"
  else
    origin="staging.yml"
  fi

  patterns=$(grep ":image-placeholder" "$STACK_NAME".yml | sed 's/:image-placeholder.*//')

  if [ -z "$patterns" ]; then
    echo "No missing image tags"
    return
  fi

  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue

    echo "Updating missing image tag with latest for ${pattern##*image: }"

    tag=$(grep -m1 -F "$pattern:" "$origin" | sed 's|.*:||')

    if [ -n "$tag" ]; then
      sed -i "s|$pattern:image-placeholder.*|$pattern:$tag|g" "$STACK_NAME".yml
    fi
  done <<< "$patterns"
}

replace_placeholders
