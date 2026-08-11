import Image from "next/image"

export const Header = () => {
  return (
    <div className="absolute top-4 left-4 z-50 p-4">
      <div className="flex gap-2">
        <Image
          alt="logo"
          src={"/icons/logo.png"}
          width={34}
          height={34}
          className="object-contain flex justify-start"
        />
        <div>
          <h2 className="font-excalifont">Public Note</h2>
          <p className="opacity-30  font-excalifont">
            A place for thoughts to wander, waiting for someone to find them.
          </p>
        </div>

      </div>
    </div>

  )
}
