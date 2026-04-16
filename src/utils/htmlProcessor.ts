export const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
    <title>AI Website Builder</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Flowbite CSS & JS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-5h5Mhxz9QI+iHPy7RbE5z29nLNK6Zj+CWNeXy7Gqf0QM8Rt1a5/fqflJb0IT2u2eV5eP5yQ5u1SUa==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Chart.js for charts & graphs -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- AOS (Animate On Scroll) for scroll animations -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>

    <!-- GSAP (GreenSock) for advanced animations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

    <!-- Lottie for JSON-based animations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.0/lottie.min.js"></script>

    <!-- Swiper.js for Sliders/carousels -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css">
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

    <!-- Optional: Tooltip & Popover Library (Tippy.js) -->
    <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
    <script src="https://unpkg.com/@popperjs/core@2"></script>
    <script src="https://unpkg.com/tippy.js@6"></script>
</head>
<body id="root">
  <!-- __CODE_PLACEHOLDER__ -->
</body>
</html>
`;

function fixImageSources(html: string) {
    const placeholder = "/1.jpg";

    return html.replace(/<img[^>]*src=["'][^"']*["'][^>]*>/g, (tag) => {
        return tag.replace(/src=["'][^"']*["']/, `src="${placeholder}"`);
    });
}

export const constructFullHtml = (bodyContent: string): string => {
    bodyContent = fixImageSources(bodyContent);
    if (!bodyContent) return "";
    // If it already looks like full HTML, return as is
    if (bodyContent.trim().toLowerCase().startsWith("<!doctype") || bodyContent.trim().toLowerCase().includes("<html")) {
        return bodyContent;
    }
    return HTML_TEMPLATE.replace("<!-- __CODE_PLACEHOLDER__ -->", bodyContent);
};

export const extractBodyContent = (fullHtml: string): string => {
    if (!fullHtml) return "";

    // Simple regex to find content inside <body id="root">...</body> or <body>...</body>
    // This assumes the saved HTML follows our template somewhat or is standard HTML
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
        return bodyMatch[1].trim();
    }

    // If no body tag found, return the whole thing assuming it might be partial
    return fullHtml;
};

export const cleanupCode = (code: string): string => {
    return code
        ?.replace("```html", "")
        .replace("```", "") || "";
}
