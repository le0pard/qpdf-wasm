FROM emscripten/emsdk:6.0.8 AS qpdf

RUN apt-get update -qq && \
    apt-get install -qq --no-install-recommends autoconf git pkg-config

WORKDIR /src

COPY shallow-clone.sh /usr/local/bin

# zlib 1.3.2
RUN shallow-clone.sh https://github.com/madler/zlib.git /src/lib/zlib da607da739fa6047df13e66a2af6b8bec7c2a498
# jpeg-turbo to 3.2.0
RUN shallow-clone.sh https://github.com/ImageMagick/jpeg-turbo.git /src/lib/jpeg-turbo 8b678d394c47c5d7cef5b896dcb09085145d0d3e
# qpdf version 12.4.1
RUN shallow-clone.sh https://github.com/qpdf/qpdf.git /src/lib/qpdf c37f83ae468abb6cc741f43b2f6fdeb66e550ffb

# first, copy files that are needed for the emscripten build, and
# that would require a full recompile if they changed
COPY js js
COPY patches patches
COPY docker_build.sh docker_build.sh

RUN ./docker_build.sh

FROM scratch AS export

COPY --from=qpdf /src/dist /opt/qpdf
