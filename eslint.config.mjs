import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Pickaly mimari kuralları (TECH_STACK §2, §8.2, §13.3)
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // Ortam değişkenleri yalnızca src/lib/env.ts üzerinden okunur (NODE_ENV hariç).
          selector:
            "MemberExpression[object.type='MemberExpression'][object.object.name='process'][object.property.name='env'][property.name!='NODE_ENV']",
          message: "Ortam değişkenlerini doğrudan okumayın; src/lib/env.ts'teki yardımcıları kullanın.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              message: "İkonları src/config/icons.ts kayıt defteri ve <Icon> bileşeni üzerinden kullanın (DESIGN §7).",
            },
          ],
        },
      ],
    },
  },
  {
    // Bileşenlerde sabit renk (HEX) yazılmaz; yalnızca token sınıfları kullanılır (DESIGN §10.5).
    files: ["src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.type='MemberExpression'][object.object.name='process'][object.property.name='env'][property.name!='NODE_ENV']",
          message: "Ortam değişkenlerini doğrudan okumayın; src/lib/env.ts'teki yardımcıları kullanın.",
        },
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}){1,2}(?:[0-9a-fA-F]{2})?$/]",
          message: "Sabit renk kullanmayın; DESIGN.md token sınıflarını kullanın (ör. bg-surface-card).",
        },
      ],
    },
  },
  {
    files: ["src/lib/env.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["src/config/icons.ts", "src/components/ui/Icon.tsx"],
    rules: { "no-restricted-imports": "off" },
  },

  // pickaly-logo/: ürün sahibinin logo kiti (kendi CommonJS betikleriyle); uygulama kodu değil, lint dışında.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/styles/tokens.ts", "pickaly-logo/**"]),
]);

export default eslintConfig;
