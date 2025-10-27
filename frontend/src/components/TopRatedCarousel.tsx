'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRight, Star, Award, Users } from 'lucide-react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/navigation';
import 'swiper/css';

import { Project } from '@/types';

interface TopRatedCarouselProps {
  projects: Project[];
  categoryName?: string;
}

export function TopRatedCarousel({
  projects,
  categoryName = 'top-rated',
}: TopRatedCarouselProps) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Daily rotation logic - changes every 24 hours
  const dailyRotatedProjects = useMemo(() => {
    if (projects.length === 0) return [];

    // Get today's date as seed for consistent rotation across all users
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );

    // Fisher-Yates shuffle with seed
    const shuffled = [...projects];
    let seed = dayOfYear * 12345; // Seed changes daily

    for (let i = shuffled.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }, [projects]);

  const css = `
    .carousel-top-rated {
      padding: 20px 0 !important;
      overflow: visible !important;
    }

    .carousel-top-rated .swiper-wrapper {
      overflow: visible !important;
    }

    .carousel-top-rated .swiper-slide {
      overflow: visible !important;
    }

    .carousel-top-rated .swiper-button-next,
    .carousel-top-rated .swiper-button-prev {
      background: transparent;
      color: hsl(var(--foreground));
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .carousel-top-rated .swiper-button-next:hover,
    .carousel-top-rated .swiper-button-prev:hover {
      background: rgba(0, 0, 0, 0.1);
      transform: scale(1.1);
    }

    .carousel-top-rated .swiper-button-next::after,
    .carousel-top-rated .swiper-button-prev::after {
      content: '';
    }
  `;

  const getCrewInfo = (project: Project): string => {
    const teamMembers = project.teamMembers || project.team_members;
    if (teamMembers && teamMembers.length > 0) {
      return teamMembers.slice(0, 2).map(m => m.name || 'Anonymous').join(' & ');
    }
    return 'Solo Build';
  };

  const getDisplayName = (project: Project): string => {
    return project.author?.displayName || project.author?.display_name || project.author?.username || 'Anonymous';
  };

  const getAvatarUrl = (project: Project): string | undefined => {
    return project.author?.avatar || project.author?.avatar_url;
  };

  const handleCardClick = (projectId: string) => {
    setExpandedId(expandedId === projectId ? null : projectId);
  };

  return (
    <div className="relative w-full">
      <style>{css}</style>

      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">
            Top Rated Projects
          </h2>
          <div className="hidden sm:flex ml-auto text-sm text-muted-foreground font-medium items-center gap-3">
            <span>
              <span className="text-primary font-bold">{dailyRotatedProjects.length}</span>
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
        {dailyRotatedProjects.length > 0 ? (
          <Swiper
            spaceBetween={30}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            grabCursor={true}
            centeredSlides={true}
            loop={dailyRotatedProjects.length > 1}
            slidesPerView="auto"
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.realIndex);
              setExpandedId(null); // Close expanded card when sliding
            }}
            navigation={{
              nextEl: '.top-rated-button-next',
              prevEl: '.top-rated-button-prev',
            }}
            className="carousel-top-rated"
            modules={[Autoplay, Navigation]}
          >
            {dailyRotatedProjects.map((project, index) => {
              const isActive = index === activeIndex;
              const isExpanded = expandedId === project.id;

              return (
                <SwiperSlide
                  key={project.id}
                  className="!w-full sm:!w-auto flex items-center justify-center"
                >
                  <motion.div
                    className="w-full sm:w-[600px]"
                    animate={{
                      height: isExpanded ? 'auto' : isActive ? 'auto' : 'auto',
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <motion.div
                      onClick={() => {
                        if (isActive) {
                          handleCardClick(project.id);
                        }
                      }}
                      className={`relative flex overflow-hidden rounded-2xl bg-card border transition-all duration-300 ${
                        isActive
                          ? 'border-primary/50 cursor-pointer'
                          : 'border-border/50 opacity-60'
                      } ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}
                      animate={{
                        height: isExpanded ? 'auto' : '320px',
                      }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                      {/* Main Layout */}
                      <div className="flex flex-col w-full h-full">
                        {/* Collapsed/Collapsed-Expanded View - Horizontal Layout */}
                        <div className="flex flex-1 overflow-hidden">
                          {/* Left Panel - User Info */}
                          <div className="relative flex-shrink-0 w-[200px] bg-gradient-to-b from-slate-900/80 to-slate-800/50 p-4 sm:p-6 flex flex-col justify-between border-r border-border/30">
                            {/* Ranking Badge */}
                            <div className="absolute top-4 right-4 bg-primary text-black px-2.5 py-1.5 rounded-full text-xs font-bold">
                              #{index + 1}
                            </div>

                            {/* User Profile */}
                            <div className="pt-8 flex flex-col gap-3">
                              <div className="flex items-start gap-3">
                                {getAvatarUrl(project) ? (
                                  <img
                                    src={getAvatarUrl(project)}
                                    alt={getDisplayName(project)}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    {getDisplayName(project)[0].toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-foreground truncate">
                                    {getDisplayName(project)}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {getCrewInfo(project)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Click hint - only show if active */}
                            <AnimatePresence>
                              {isActive && !isExpanded && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="text-xs text-muted-foreground text-center"
                                >
                                  Click to expand
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Right Panel - Project Details */}
                          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2 mb-2">
                                {project.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                {project.description}
                              </p>
                            </div>

                            {/* Project Meta */}
                            <div className="flex flex-wrap gap-1.5">
                              {project.techStack && project.techStack.slice(0, 3).map((tech) => (
                                <span
                                  key={tech}
                                  className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.techStack && project.techStack.length > 3 && (
                                <span className="text-xs px-2 py-1 text-muted-foreground">
                                  +{project.techStack.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details Section */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-border/30 p-4 sm:p-6 bg-secondary/10 overflow-y-auto max-h-[400px]"
                            >
                              {/* Score Display */}
                              <div className="flex gap-3 mb-6 text-sm flex-wrap">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <span className="font-semibold text-foreground">
                                    {project.proofScore?.total?.toFixed(1) || '0'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-primary" />
                                  <span className="text-muted-foreground">
                                    {project.voteCount || 0} votes
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-400" />
                                  <span className="text-muted-foreground">
                                    {project.commentCount || 0} comments
                                  </span>
                                </div>
                              </div>

                              {/* Score Breakdown */}
                              {project.proofScore && (
                                <div className="bg-secondary/30 rounded-lg p-3 mb-4">
                                  <h4 className="text-xs font-bold text-foreground mb-2">
                                    Score Breakdown
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Verification</p>
                                      <p className="text-sm font-semibold text-primary">
                                        {project.proofScore.verification?.toFixed(1) || '0'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Community</p>
                                      <p className="text-sm font-semibold text-primary">
                                        {project.proofScore.community?.toFixed(1) || '0'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Validation</p>
                                      <p className="text-sm font-semibold text-primary">
                                        {project.proofScore.validation?.toFixed(1) || '0'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Quality</p>
                                      <p className="text-sm font-semibold text-primary">
                                        {project.proofScore.quality?.toFixed(1) || '0'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Team Members */}
                              {(project.teamMembers || project.team_members)?.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-xs font-bold text-foreground mb-2">
                                    Team
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(project.teamMembers || project.team_members)?.map((member, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-secondary/30"
                                      >
                                        {member.avatar || member.avatar_url || member.image ? (
                                          <img
                                            src={
                                              member.avatar ||
                                              member.avatar_url ||
                                              member.image
                                            }
                                            alt={member.name}
                                            className="w-5 h-5 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold">
                                            {member.name[0]?.toUpperCase()}
                                          </div>
                                        )}
                                        <span className="text-xs font-medium">
                                          {member.name}
                                        </span>
                                        {member.role && (
                                          <span className="text-xs text-muted-foreground">
                                            ({member.role})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tech Stack */}
                              {project.techStack?.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-xs font-bold text-foreground mb-2">
                                    Tech Stack
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {project.techStack.map((tech) => (
                                      <span
                                        key={tech}
                                        className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Badges */}
                              {project.badges?.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-xs font-bold text-foreground mb-2">
                                    Badges
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {project.badges.map((badge) => (
                                      <div
                                        key={badge.id}
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                          badge.type === 'platinum'
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            : badge.type === 'gold'
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                        }`}
                                        title={badge.description}
                                      >
                                        {badge.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Links */}
                              <div className="flex gap-2 pt-2 border-t border-border/20">
                                {project.demoUrl && (
                                  <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-primary text-black font-semibold text-center hover:bg-primary/90 transition-colors text-xs"
                                  >
                                    Demo
                                  </a>
                                )}
                                {project.githubUrl && (
                                  <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 font-semibold text-center transition-colors text-xs"
                                  >
                                    GitHub
                                  </a>
                                )}
                              </div>

                              {/* Close hint */}
                              <p className="text-xs text-muted-foreground text-center mt-3">
                                Click to collapse
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </motion.div>
                </SwiperSlide>
              );
            })}

            {/* Navigation Buttons - Same style as other carousels */}
            <>
              <div className="top-rated-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer">
                <ChevronLeftIcon className="h-6 w-6 text-foreground" />
              </div>
              <div className="top-rated-button-next absolute right-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer">
                <ChevronRightIcon className="h-6 w-6 text-foreground" />
              </div>
            </>
          </Swiper>
        ) : (
          <div className="flex items-center justify-center h-[320px] rounded-lg border border-border/40 bg-secondary/20">
            <div className="text-center">
              <p className="text-muted-foreground font-medium">
                No top rated projects found
              </p>
            </div>
          </div>
        )}

        {/* Mobile hint */}
        <div className="sm:hidden mt-3 text-center text-xs text-muted-foreground font-medium">
          Swipe to explore →
        </div>
      </motion.div>
    </div>
  );
}
