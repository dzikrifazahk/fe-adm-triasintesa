"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import TopRight from "@/assets/signin/top-right.svg";
import LeftMiddle from "@/assets/signin/left-middle.svg";
import BottomRight from "@/assets/signin/bottom-right.svg";
import Dot from "@/assets/signin/2dot.svg";
import CarouselImage1 from "@/assets/signin/carousel-img-1.svg";
import CarouselImage2 from "@/assets/signin/carousel-img-2.svg";
import CarouselImage3 from "@/assets/signin/carousel-img-3.svg";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { getDictionary } from "../../../get-dictionary";
import Logo from "../logo";

const LeftLayout = ({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["signin"];
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false }),
  );

  useEffect(() => {
    if (!carouselApi) return;

    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
      setTotalItems(carouselApi.scrollSnapList().length);
    };

    updateCarouselState();

    carouselApi.on("select", updateCarouselState);

    return () => {
      carouselApi.off("select", updateCarouselState);
    };
  }, [carouselApi]);

  const scrollToIndex = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  const carouselData = [
    {
      title: `${dictionary?.ll_title_2 ?? "-"}`,
      description: `${dictionary?.ll_description_2 ?? "-"}`,
      icon: (
        <Image
          src={CarouselImage2}
          alt="Dashboard Icon"
          className="w-[414px] p-5"
        />
      ),
      to: "/dashboard",
    },
    // {
    //   title: `${dictionary?.ll_title_1 ?? "-"}`,
    //   description: `${dictionary?.ll_description_1 ?? "-"}`,
    //   icon: <Image src={CarouselImage1} alt="" className="w-[414px] p-5" />,
    //   to: "/settings",
    // },
    {
      title: `${dictionary?.ll_title_3 ?? "-"}`,
      description: `${dictionary?.ll_description_3 ?? "-"}`,
      icon: (
        <Image
          src={CarouselImage3}
          alt="Notification Icon"
          className="w-[414px] p-5"
        />
      ),
      to: "/notifications",
    },
  ];

  return (
    <div className="w-full h-full bg-iprimary-blue-tertiary">
      <div className="relative h-full">
        <div className="absolute right-0">
          <Image src={TopRight} alt="top-right" className="w-52" />
        </div>
        <div className="absolute left-0 top-36">
          <Image src={LeftMiddle} alt="left-middle" className="w-52 " />
        </div>
        <div className="absolute right-0 bottom-0">
          <Image
            src={BottomRight}
            alt="left-middle"
            priority={false}
            className="w-36"
            quality={50}
          />
        </div>
        <div className="absolute left-0 bottom-16">
          <div className="bg-iprimary-blue-fourth w-24 h-12 rounded-r-lg"></div>
        </div>
        <div className="absolute left-0 bottom-3">
          <div className="bg-iprimary-blue-fourth w-36 h-12 rounded-r-lg"></div>
        </div>
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <Image src={Dot} alt="left-middle" className="w-12" />
        </div>
        <div className="absolute top-32 left-[55%] transform -translate-x-1/2">
          {/* <Image src={Dot2} alt="left-middle" /> */}
        </div>

        <div className="w-full h-full p-5 ">
          <div className="h-full w-full flex flex-col gap-5">
            <div className="bg-white p-3 rounded-2xl w-fit">
              <Logo className="w-36" />
            </div>
            <div className="flex h-full flex-col justify-center items-center gap-5">
              <Carousel
                plugins={[plugin.current]}
                className="w-full max-w-md"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                setApi={setCarouselApi}
              >
                <CarouselContent>
                  {carouselData.map((item, index) => (
                    <CarouselItem key={index}>
                      <div className="">
                        {item.icon}
                        <div className="text-center">
                          <span className="text-2xl font-sans-bold text-white">
                            {item.title}
                          </span>
                          <p className="text-sm font-sans text-white">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {totalItems > 0 && (
                <div className="flex justify-center space-x-2 z-20">
                  {Array.from({ length: totalItems }).map((_, index) => (
                    <div
                      key={index}
                      onClick={() => scrollToIndex(index)}
                      className={`w-10 h-1 cursor-pointer rounded-lg ${
                        currentIndex === index
                          ? "bg-white"
                          : "bg-white opacity-30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="h-10 ml-5 flex items-end font-sans-bold text-white z-10">
              Ver. 1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftLayout;
