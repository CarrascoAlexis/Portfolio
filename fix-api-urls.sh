#!/bin/bash
cd front/src
for file in $(find . -name "*.tsx" -o -name "*.ts"); do
  if grep -q "localhost:4000" "$file" 2>/dev/null; then
    echo "Fixing $file"
    sed -i "s|http://localhost:4000/api|\${API_BASE}|g" "$file"
    sed -i "s|http://localhost:4000|\${API_URL}|g" "$file"
    
    # Add import if not present and file uses API_BASE or API_URL
    if grep -q '\${API_' "$file" && ! grep -q "from.*config/api" "$file"; then
      # Add import after first existing import or at start
      sed -i "1 a import { API_BASE, API_URL } from '../config/api';" "$file" 2>/dev/null || \
      sed -i "1 a import { API_BASE, API_URL } from '../../config/api';" "$file" 2>/dev/null || \
      sed -i "1 a import { API_BASE, API_URL } from './config/api';" "$file"
    fi
  fi
done
