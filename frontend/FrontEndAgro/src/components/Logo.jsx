import logoCompleta from "../assets/logos/logo completa transparente.png";

function Logo({
  alt = "AgroControl",
  className = "h-14 w-44",
  imageClassName = "h-16 origin-left scale-[2.4]",
}) {
  return (
    <div className={`flex items-center overflow-hidden ${className}`}>
      <img
        src={logoCompleta}
        alt={alt}
        className={`w-auto max-w-none object-contain ${imageClassName}`}
      />
    </div>
  );
}

export default Logo;
