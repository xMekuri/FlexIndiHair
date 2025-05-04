import { Helmet } from "react-helmet";
import HeroSlider from "@/components/Home/HeroSlider";
import FeaturesBar from "@/components/Home/FeaturesBar";
import CategoryHighlights from "@/components/Home/CategoryHighlights";
import Bestsellers from "@/components/Home/Bestsellers";
import Testimonials from "@/components/Home/Testimonials";
import InstagramFeed from "@/components/Home/InstagramFeed";
import NewsletterSignup from "@/components/Home/NewsletterSignup";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>FlexIndi Hair - Premium Hair Extensions</title>
        <meta 
          name="description" 
          content="Transform your look with our luxury, 100% real human hair extensions. FlexIndi Hair offers premium quality hair extensions and hair care products." 
        />
      </Helmet>
      
      <HeroSlider />
      <FeaturesBar />
      <CategoryHighlights />
      <Bestsellers />
      <Testimonials />
      <InstagramFeed />
      <NewsletterSignup />
    </>
  );
}
