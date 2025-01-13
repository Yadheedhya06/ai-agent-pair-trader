/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Exclude native modules (.node files) from Webpack bundling
        config.externals = config.externals || [];
        config.externals.push((context, request, callback) => {
            if (request.match(/\.node$/)) {
                return callback(null, `commonjs ${request}`);
            }
            callback();
        });

        // Ensure .node files are handled properly
        config.module.rules.push({
            test: /\.node$/,
            use: "node-loader",
        });

        config.resolve = {
            ...config.resolve,
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".node"],
        };

        return config;
    },
};

export default nextConfig;
