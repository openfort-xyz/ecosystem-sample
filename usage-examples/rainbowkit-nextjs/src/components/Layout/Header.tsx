import { CustomLogo } from "../Shared/CustomLogo";

export default function Header(props: any) {
  return (
    <div className="bg-gray-200 flex w-full sm:text-center text-left items-center p-4">
      <CustomLogo />
      <div className="text-zinc-700 w-full sm:justify-center justify-start">
        THIRD-PARTY AUTH WITH ECOSYSTEM WALLET
        <a
          href="https://github.com/openfort-xyz/ecosystem-sample"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500"
        >
          (View Source)
        </a>
      </div>
    </div>
  );
}
