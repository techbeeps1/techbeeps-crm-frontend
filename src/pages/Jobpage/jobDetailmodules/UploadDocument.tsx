import React, { useState } from 'react';



const UploadDocument: React.FC = () => {
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    return (
        <>
            <div>
                <div className="flex mb-5 ml-4">
                    <button
                        className="inline-flex items-center justify-center gap-2.5 rounded-md bg-meta-3 py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                        type="button"
                        onClick={() => setIsDocumentModalOpen(true)}
                    >
                        Upload document
                    </button>
                </div>
                <br />
                <div className="col-span-1 overflow-auto">
                    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                        <div className="overflow-hidden">
                            <table className="min-w-full text-left text-sm font-light">
                                <thead className="border-b font-medium dark:border-neutral-500">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">
                                            File name
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Type
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Made on
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            No documents were found, you can upload a
                                            document above.
                                            {/* {documentList.length && (
                            <tbody>
                              {documentList.map((document: any) => (
                                <tr key={document._id}>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    {document.filename}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    {document.mimetype}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4"></td>
                                </tr>
                              ))}
                            </tbody>
                          )} */}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


            <div className="max-h-screen flex items-center justify-center">
                {isDocumentModalOpen && (
                    <div
                        className={`fixed inset-0 flex items-center justify-center z-50 ${isDocumentModalOpen ? '' : 'hidden'
                            }`}
                    >
                        <div className="fixed inset-0 bg-black opacity-80"></div>
                        <div className="inset-0 w-full flex items-center justify-center z-50">
                            <div
                                className=" bg-white p-4 rounded-lg shadow-lg
              "
                            >
                                <div
                                    className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"

                                >
                                    <h1 className="font-extrabold text-primary-3 ml-2">
                                        {' '}
                                        Upload Document
                                    </h1>
                                    <form>
                                        <div className="p-6.5">
                                            <div className="mb-4.5">
                                                <label className="mb-2.5 block text-black dark:text-white">
                                                    File name
                                                </label>
                                                {/* {file && file.name} */}
                                            </div>
                                            <div className="mb-4.5">
                                                <label className="mb-2.5 block text-black dark:text-white">
                                                    Type document
                                                </label>
                                                <div className="relative z-20 bg-transparent dark:bg-form-input">
                                                    {/* {file && file.type} */}
                                                </div>
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="fileInput"
                                                    className="flex cursor-pointer items-center justify-center gap-2 rounded bg-primary py-1 px-2 text-sm font-medium text-white hover:bg-opacity-80 xsm:px-4"
                                                >
                                                    <input
                                                        type="file"
                                                        id="fileInput"
                                                        className="sr-only"
                                                        name="file"
                                                    // value={uploadDocumentFormData.mimetype}
                                                    // onChange={(event) => {
                                                    //   const file = event.target.files?.[0];
                                                    //   setFile(file || null);
                                                    // }}
                                                    />
                                                    <span>Upload document</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                                <button
                                                    className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                                                    type="button"
                                                    onClick={() => setIsDocumentModalOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="text-black bg-primary active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                                    type="submit"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default UploadDocument;
