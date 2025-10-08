#!/bin/bash
cd /home/kavia/workspace/code-generation/music-stream-and-discover-31085-31094/music_streaming_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

