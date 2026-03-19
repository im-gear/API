import nextConfig from 'eslint-config-next';

export default [
    ...nextConfig,
    {
        files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "react-hooks/exhaustive-deps": "warn",
            "react/no-unescaped-entities": "off",
            "import/no-anonymous-default-export": "off"
        }
    },
    {
        ignores: [
            "src/components/ApiTester/apis/**/*.tsx",
            "src/components/ApiTester/UnifiedApiTester.tsx",
            "src/components/ApiTester/utils.ts",
            "**/.next/**",
            "src/app/.well-known/workflow/v1/**"
        ]
    }
];
