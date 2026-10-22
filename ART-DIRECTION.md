# Direção visual e assets — Container Vision / SIAMAC

Os componentes fotorrealistas foram gerados pelo recurso integrado de geração de imagens (built-in imagegen). São representações ilustrativas, não fotografias de uma instalação real e não são imagens obtidas pelas câmeras do produto. A abertura mostra um caminhão completo transportando um contêiner. A carroceria, as rodas e a carga são desenhadas em camadas no Canvas a partir da mesma imagem. A carroceria sai para a esquerda enquanto o próprio contêiner passa para o volume tridimensional. Lateral, teto e portas giram como um volume único até o enquadramento frontal.

A logo é o arquivo original fornecido pelo usuário, preservado como `assets/siamac-logo.png`. Não foi redesenhada nem gerada por IA.

## Assets finais

- `assets/container-truck.webp`: caminhão branco com contêiner laranja, vista lateral, cabine voltada para a esquerda. Arquivo com transparência, 1600 × 694 px, preparado em WebP a partir do PNG gerado.
- `assets/container-cargo.webp`: textura do teto, projetada nos cantos compartilhados do volume. A lateral usa a área do contêiner na imagem do caminhão.
- `assets/container-door.webp`: textura das portas durante toda a sequência e imagem frontal para identificação.
- `assets/siamac-logo.png`: marca fornecida pelo usuário.

Formato WebP com transparência preservada nos componentes recortados. Os originais PNG são mantidos na área de geração; a codificação em WebP apenas prepara os arquivos para a página.

## Continuidade e rodas

O arquivo do caminhão permanece intacto. O Canvas mascara a área da carga na carroceria e usa essa mesma área como textura da lateral do volume. A carga acompanha o veículo no início e gira diretamente da posição na carroceria até o enquadramento final da porta. O centro, a escala e a rotação seguem um único percurso, sem utilizar a posição antiga do guindaste, sem enquadramento intermediário e sem fade entre dois contêineres.

Os discos das três rodas são redesenhados em máscaras circulares centradas nos eixos. O ângulo é calculado pela distância percorrida dividida pelo raio do pneu. Não há rotação independente da rolagem; ao parar, as rodas param, e ao voltar, giram no sentido inverso. O modo de movimento reduzido mantém as etapas estáticas.

Cada face recebe uma base opaca na cor do material antes da aplicação da textura. Essa base cobre a transparência residual nas bordas dos recortes; uma pequena sobreposição nas arestas também fecha o antialiasing entre faces. Assim, o fundo da página não aparece nas junções entre lateral, teto e portas.

## Conjunto de prompts final

### Caminhão — atualização de 22/10/2026

Ferramenta: `image_gen` integrado, com fundo transparente. A imagem anexada pelo usuário foi usada apenas como referência de composição. Prompt final:

> Use case: product-mockup. Asset type: transparent photographic cutout for the opening scene of a logistics website, animated as a complete vehicle. Input image 1 is a composition reference only. Create a NEW, highly photorealistic image of a real-looking white modern cab-over truck carrying a single orange corrugated steel intermodal shipping container mounted securely on its chassis. Match the reference arrangement: pure side elevation, cab facing LEFT, entire truck and container visible, level wheels, natural realistic proportions, three axles, container behind and above the cab/chassis. The container is a conventional 20-foot freight shipping container with realistic corrugations, corner castings, subtle scratches and weathering. The cab, tires, glass, mirrors, metal and shadows should have convincing real product photography textures, not a cartoon, illustration or plastic 3D render. Neutral soft daylight from upper left. Wide horizontal composition, vehicle fills most width, with modest transparent margin all around; no cropping. Actual transparent alpha background, including the area around wheels and underneath chassis. No road, buildings, sky, floor, scenery, background colors or checkerboard. No detached container, crane, reach stacker or forklift. No text, logos, labels or watermarks. Keep the vehicle perfectly still in the image so code can move the whole loaded truck across the scene.

### Contêiner e porta — assets preservados

1. Contêiner intermodal de 20 pés em aço corrugado laranja, perspectiva três quartos com lateral longa à esquerda e portas fechadas à direita, teto visível, ferragens realistas, desgaste sutil. Inscrições de exemplo CSQU 305438 3 e 22G1. Fundo alfa transparente, sem caminhão ou outras máquinas.
2. Fotografia frontal simétrica das duas portas fechadas do mesmo tipo de contêiner laranja, aço corrugado, quatro barras de travamento, dobradiças e desgaste realista. Na porta direita, texto em stencil: CSQU / 305438 3, último dígito em uma caixa / 22G1. Abaixo: MAX. GROSS 30 480 KG, TARE 2 180 KG, NET 28 300 KG, CU. CAP. 33.2 CU.M. Sem interface ou fundo externo.
