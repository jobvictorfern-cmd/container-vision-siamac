# Direção visual e assets — Container Vision / SIAMAC

Os componentes fotorrealistas foram gerados pelo recurso integrado de geração de imagens (built-in imagegen). São representações ilustrativas, não fotografias de uma instalação real e não são imagens obtidas pelas câmeras do produto. A animação combina camadas articuladas do equipamento com um contêiner de geometria 3D texturizada em Canvas. Lateral, teto e portas giram como um volume único até o enquadramento frontal.

A logo é o arquivo original fornecido pelo usuário, preservado como `assets/siamac-logo.png`. Não foi redesenhada nem gerada por IA.

## Assets finais

- `assets/stacker-base.webp`: chassi, cabine e pneus do reach stacker.
- `assets/stacker-boom.webp`: braço telescópico independente, articulado pelo código.
- `assets/container-cargo.webp`: origem das texturas da lateral e do teto, projetadas nos cantos compartilhados do volume.
- `assets/container-door.webp`: textura das portas durante toda a sequência e imagem frontal para identificação.
- `assets/siamac-logo.png`: marca fornecida pelo usuário.

Formato WebP com transparência preservada nos componentes recortados. Os originais PNG são mantidos na área de geração; a codificação em WebP apenas prepara os arquivos para a página.

## Conjunto de prompts final

1. Fotografia de produto ultrarrealista, recorte com alfa transparente: base de um reach stacker industrial laranja-vermelho, sem braço e sem contêiner, quatro pneus grandes, cabine envidraçada, peças hidráulicas, escadas e contrapeso. Câmera elevada em três quartos, frente apontando à direita, luz neutra pelo alto à esquerda. Sem pessoas, marcas ou fundo.
2. Com a base como referência de material, luz e ângulo, criar apenas o braço telescópico em aço escuro, quase horizontal da esquerda à direita, articulação à esquerda e ponta à direita, mangueiras, cilindro cromado e desgaste sutil. Alfa transparente, sem base, cabine, contêiner ou spreader.
3. Contêiner intermodal de 20 pés em aço corrugado laranja, perspectiva três quartos com lateral longa à esquerda e portas fechadas à direita, teto visível, ferragens realistas, desgaste sutil. Inscrições de exemplo CSQU 305438 3 e 22G1. Fundo alfa transparente, sem caminhão ou outras máquinas.
4. Fotografia frontal simétrica das duas portas fechadas do mesmo tipo de contêiner laranja, aço corrugado, quatro barras de travamento, dobradiças e desgaste realista. Na porta direita, texto em stencil: CSQU / 305438 3, último dígito em uma caixa / 22G1. Abaixo: MAX. GROSS 30 480 KG, TARE 2 180 KG, NET 28 300 KG, CU. CAP. 33.2 CU.M. Sem interface ou fundo externo.
