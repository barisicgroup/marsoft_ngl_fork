class MariliaDataProvider {
    private static getDataFolderURL() : string {
        return window.location.href + "build/marilia_data/";
    }

    private static getSdfFilesFolderURL() : string {
        return this.getDataFolderURL() + "sdf_structures/";
    }

    // TODO string param can be replaced with some enum etc.
    public static getAminoAcidStructureFilePath(aaName : string) : string {
        const aaNameLwr = aaName.toLowerCase();

        if(aaNameLwr === "arg") {
            return this.getSdfFilesFolderURL() + "arginine.sdf";
        }
        else if(aaNameLwr === "cys") {
            return this.getSdfFilesFolderURL() + "cysteine.sdf";
        }
    
        return "";
    }
}

export default MariliaDataProvider;