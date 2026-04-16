import { Variants } from "framer-motion";

// ============================================
// AI Suite v5.1 - Animation Library
// Premium animations for a polished UI
// ============================================

// ----- Fade Animations -----
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
};

// ----- Scale Animations -----
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const scaleInBounce: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.68, -0.55, 0.265, 1.55],
        },
    },
};

export const popIn: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
        },
    },
};

// ----- Slide Animations -----
export const slideInUp: Variants = {
    hidden: { y: "100%" },
    visible: {
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { y: "100%", transition: { duration: 0.3 } },
};

export const slideInDown: Variants = {
    hidden: { y: "-100%" },
    visible: {
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { y: "-100%", transition: { duration: 0.3 } },
};

export const slideInLeft: Variants = {
    hidden: { x: "-100%" },
    visible: {
        x: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { x: "-100%", transition: { duration: 0.3 } },
};

export const slideInRight: Variants = {
    hidden: { x: "100%" },
    visible: {
        x: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { x: "100%", transition: { duration: 0.3 } },
};

// ----- Container/Stagger Animations -----
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const staggerContainerFast: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
};

export const staggerContainerSlow: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export const staggerItemScale: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

// ----- Card Animations -----
export const cardHover = {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2, ease: "easeOut" },
};

export const cardTap = {
    scale: 0.98,
    transition: { duration: 0.1 },
};

export const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    hover: {
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" },
    },
};

// ----- Button Animations -----
export const buttonHover = {
    scale: 1.02,
    transition: { duration: 0.15 },
};

export const buttonTap = {
    scale: 0.98,
    transition: { duration: 0.1 },
};

export const buttonVariants: Variants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
};

// ----- Page Transitions -----
export const pageTransition: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 },
    },
};

export const pageSlide: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: { duration: 0.2 },
    },
};

// ----- Modal/Dialog Animations -----
export const modalBackdrop: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: 0.15 },
    },
};

export const modalSlideUp: Variants = {
    hidden: { opacity: 0, y: "100%" },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 35,
        },
    },
    exit: {
        opacity: 0,
        y: "100%",
        transition: { duration: 0.2 },
    },
};

// ----- Sidebar Animations -----
export const sidebarVariants: Variants = {
    open: {
        width: "280px",
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    closed: {
        width: "80px",
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
};

export const sidebarItemText: Variants = {
    open: {
        opacity: 1,
        width: "auto",
        marginLeft: "12px",
        transition: { duration: 0.2, delay: 0.1 },
    },
    closed: {
        opacity: 0,
        width: 0,
        marginLeft: 0,
        transition: { duration: 0.1 },
    },
};

// ----- Notification/Toast Animations -----
export const toastVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
        },
    },
    exit: {
        opacity: 0,
        x: 100,
        transition: { duration: 0.2 },
    },
};

// ----- List Item Animations -----
export const listItem: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
            ease: "easeOut",
        },
    }),
};

// ----- Tooltip Animations -----
export const tooltipVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.15, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.1 },
    },
};

// ----- Skeleton/Loading Animations -----
export const skeletonPulse: Variants = {
    animate: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

// ----- Rotate Animations -----
export const rotate360: Variants = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: "linear",
        },
    },
};

// ----- Float Animations -----
export const float: Variants = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

// ----- Glow Pulse -----
export const glowPulse: Variants = {
    animate: {
        boxShadow: [
            "0 0 20px rgba(139, 92, 246, 0.3)",
            "0 0 40px rgba(139, 92, 246, 0.5)",
            "0 0 20px rgba(139, 92, 246, 0.3)",
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

// ----- Typing Animation -----
export const typingContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
        },
    },
};

export const typingCharacter: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

// ----- Utility function for creating custom delays -----
export const createDelayedVariant = (
    baseVariant: Variants,
    delay: number
): Variants => ({
    hidden: baseVariant.hidden,
    visible: {
        ...(typeof baseVariant.visible === "object" ? baseVariant.visible : {}),
        transition: {
            ...(typeof baseVariant.visible === "object" &&
            baseVariant.visible.transition
                ? baseVariant.visible.transition
                : {}),
            delay,
        },
    },
});
