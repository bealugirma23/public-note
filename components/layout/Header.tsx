import Image from "next/image"

export const Header = () => {

  return (
    <div className="absolute top-4 left-4 z-50 p-1 xl:p-4">
      <div className="flex flex-col md:flex-row gap-2">
        <Image
          alt="logo"
          src={"/icons/logo.png"}
          width={34}
          height={34}
          className="object-contain flex justify-start"
        />
        <div className="max-w-full sm:max-w-xl">
          <h2 className="font-excalifont text-xl sm:text-2xl md:text-3xl leading-tight">
            Public Note
          </h2>

          <p className="font-excalifont text-sm sm:text-base md:text-lg leading-relaxed opacity-30 text-balance">
            A place for thoughts to wander, waiting for someone to find them.
          </p>
        </div>      </div>
    </div>

  )
}
