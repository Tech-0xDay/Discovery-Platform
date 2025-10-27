'use client';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRight } from 'lucide-react';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css';

import { ProjectCard } from '@/components/ProjectCard';
import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectCarouselProps {
  projects: Project[];
  categoryTitle: string;
  categoryIcon?: React.ReactNode;
  categoryName?: string;
  autoplay?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  enableTagFiltering?: boolean;
}

export function ProjectCarousel({
  projects,
  categoryTitle,
  categoryIcon,
  categoryName = '',
  autoplay = true,
  showPagination = false,
  showNavigation = true,
  enableTagFiltering = false,
}: ProjectCarouselProps) {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags from projects
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((project) => {
      project.techStack?.forEach((tech) => tags.add(tech));
    });
    return Array.from(tags).sort();
  }, [projects]);

  // Filter projects by selected tag
  const filteredProjects = useMemo(() => {
    if (!selectedTag || !enableTagFiltering) return projects;
    return projects.filter((project) =>
      project.techStack?.includes(selectedTag)
    );
  }, [projects, selectedTag, enableTagFiltering]);

  const css = `
    .carousel-coverflow {
      padding-bottom: 0 !important;
      padding-top: 10px !important;
      overflow: visible !important;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .carousel-coverflow::-webkit-scrollbar {
      display: none;
    }

    .carousel-coverflow .swiper-wrapper {
      overflow: visible !important;
    }

    .carousel-coverflow .swiper-slide {
      transform-style: preserve-3d;
      overflow: visible !important;
    }

    .carousel-coverflow .swiper-slide-visible > div {
      height: 480px !important;
    }

    @media (min-width: 640px) {
      .carousel-coverflow .swiper-slide-visible > div {
        height: 500px !important;
      }
    }

    @media (min-width: 768px) {
      .carousel-coverflow .swiper-slide-visible > div {
        height: 520px !important;
      }
    }

    .carousel-coverflow .swiper-slide-prev > div,
    .carousel-coverflow .swiper-slide-next > div {
      height: 480px !important;
    }

    @media (min-width: 640px) {
      .carousel-coverflow .swiper-slide-prev > div,
      .carousel-coverflow .swiper-slide-next > div {
        height: 500px !important;
      }
    }

    @media (min-width: 768px) {
      .carousel-coverflow .swiper-slide-prev > div,
      .carousel-coverflow .swiper-slide-next > div {
        height: 520px !important;
      }
    }

    .carousel-coverflow .swiper-button-next,
    .carousel-coverflow .swiper-button-prev {
      background: transparent;
      color: white;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .carousel-coverflow .swiper-button-next:hover,
    .carousel-coverflow .swiper-button-prev:hover {
      background: rgba(0, 0, 0, 0.2);
      transform: scale(1.1);
    }

    .carousel-coverflow .swiper-button-next::after,
    .carousel-coverflow .swiper-button-prev::after {
      content: '';
    }

    .carousel-coverflow .swiper-pagination-bullet {
      background: rgba(255, 255, 255, 0.5);
      width: 8px;
      height: 8px;
    }

    .carousel-coverflow .swiper-pagination-bullet-active {
      background: white;
    }
  `;

  return (
    <div className="relative w-full">
      <style>{css}</style>

      {/* Category Header */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">
            {categoryTitle}
          </h2>
          <div className="hidden sm:flex ml-auto text-sm text-muted-foreground font-medium items-center gap-3">
            <span>
              <span className="text-primary font-bold">{filteredProjects.length}</span>
              &nbsp;projects
            </span>
            {categoryName && (
              <button
                onClick={() => navigate(`/gallery/${categoryName}`)}
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
                title="View all projects in this category"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tag Filter - only show if enableTagFiltering is true and tags exist */}
        {enableTagFiltering && allTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedTag === null
                  ? 'bg-primary text-black'
                  : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  selectedTag === tag
                    ? 'bg-primary text-black'
                    : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <motion.div
        initial={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          duration: 0.3,
          delay: 0.1,
        }}
        className="relative w-full"
      >
        {filteredProjects.length > 0 ? (
          <Swiper
            spaceBetween={40}
            autoplay={
              autoplay
                ? {
                    delay: 5000,
                    disableOnInteraction: false,
                  }
                : false
            }
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={autoplay || filteredProjects.length > 3}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 0,
              slideShadows: false,
              stretch: 0,
              depth: 60,
              modifier: 1.5,
            }}
            pagination={
              showPagination
                ? {
                    clickable: true,
                  }
                : false
            }
            navigation={
              showNavigation
                ? {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }
                : false
            }
            className="carousel-coverflow !pb-8"
            modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          >
            {filteredProjects.map((project) => (
              <SwiperSlide
                key={project.id}
                className="!w-full sm:!w-96 flex items-stretch"
              >
                <div className="h-[480px] sm:h-[500px] md:h-[520px] w-full px-2 flex">
                  <ProjectCard project={project} />
                </div>
              </SwiperSlide>
            ))}

            {/* Navigation Buttons */}
            {showNavigation && (
              <>
                <div className="swiper-button-prev absolute left-0 top-1/3 -translate-y-1/2 z-20 cursor-pointer">
                  <ChevronLeftIcon className="h-6 w-6 text-foreground" />
                </div>
                <div className="swiper-button-next absolute right-0 top-1/3 -translate-y-1/2 z-20 cursor-pointer">
                  <ChevronRightIcon className="h-6 w-6 text-foreground" />
                </div>
              </>
            )}
          </Swiper>
        ) : (
          <div className="flex items-center justify-center h-[400px] rounded-lg border border-border/40 bg-secondary/20">
            <div className="text-center">
              <p className="text-muted-foreground font-medium">
                No projects found with selected tag
              </p>
            </div>
          </div>
        )}

        {/* Mobile hint */}
        <div className="sm:hidden mt-2 text-center text-xs text-muted-foreground font-medium">
          Swipe to explore →
        </div>
      </motion.div>
    </div>
  );
}
