FROM emscripten/emsdk:4.0.23 AS qpdf

RUN apt-get update -qq && \
    apt-get install -qq --no-install-recommends autoconf git pkg-config

WORKDIR /src

COPY shallow-clone.sh /usr/local/bin

# zlib 1.3.1.2
RUN shallow-clone.sh https://github.com/madler/zlib.git /src/lib/zlib 570720b0c24f9686c33f35a1b3165c1f568b96be
# jpeg-turbo to 3.1.3
RUN shallow-clone.sh https://github.com/ImageMagick/jpeg-turbo.git /src/lib/jpeg-turbo 39f62334a71d63ad067ec23192e38b411ee39fe7
# qpdf version 12.3.0
RUN shallow-clone.sh https://github.com/qpdf/qpdf.git /src/lib/qpdf e1af26a3a76336113e3fc9061df32d7a58eb7469

# first, copy files that are needed for the emscripten build, and
# that would require a full recompile if they changed
COPY js js
COPY patches patches
COPY docker_build.sh docker_build.sh

RUN ./docker_build.sh

FROM scratch AS export

COPY --from=qpdf /src/dist /opt/qpdf
