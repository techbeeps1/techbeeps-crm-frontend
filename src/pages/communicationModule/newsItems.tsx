import { useState, useEffect } from 'react';
import { setFormField, resetForm } from '../Redux/formSlice';
import { useDispatch, useSelector } from 'react-redux';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import EditNewsItem from '../EditTemplateForm/Communication/editNewsItem';
import { toast } from 'react-toastify';


function NewsItems() {
  const [showNewsItemsFrom, setShowNewsItemsFrom] = useState(false);
  const [newsItemList, setNewsItemList] = useState([] as any);
  const [selectedNewsItem, setSelectedNewsItem] = useState([] as any);
  const [totalNewsItem, setTotalNewsItem] = useState(0);
  const [currentNewsItemPage, setCurrentNewsItemPage] = useState(1);
  const [isNewsItemSelected, setIsNewsItemSelected] = useState(false);
  const staffPageSize = 5;

  const newsItemsForm = 'newsItems';
  const formState = useSelector((state: any) => state.forms[newsItemsForm]);
  const dispatch = useDispatch();

  function getNewsItemList() {
    axios
      .get(
        `${apiPath}/Communication/newsItemsList?page=${currentNewsItemPage}&pageSize=${staffPageSize}`,
      )
      .then((response) => {
        setNewsItemList(response.data.newsItemsList);
        setTotalNewsItem(response.data.totalNewsItem);
      })
      .catch((error) => {
        console.error('Error fetching staff data:', error);
      });
  }

  useEffect(() => {
    getNewsItemList();
  }, [currentNewsItemPage]);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({ formName: newsItemsForm, field: name, value } as any),
    );
    console.log(name, value);
  };

  const handleNewsItemClick = (newsItem: any) => {
    setSelectedNewsItem(newsItem);
    setIsNewsItemSelected(true);
    setShowNewsItemsFrom(false);
  };

  // create news item handlar
  const handleFormSubmission = async (e: any) => {
    e.preventDefault();

    if(formState.title.trim() === "" || formState.body.trim() === "" || formState.publishAt.trim() === "") {

      toast.error("Please fill all the fields")
      return;
    }
    if(formState.title.length < 5 || formState.body.length > 100) {
      toast.error("News title should be between 5 and 100 characters long")
      return;
    }
    if(formState.body.length > 1000 || formState.body.length < 10) {
      toast.error("News content should be between 10 and 1000 characters long")
      return;
    }


    const response = await fetch(`${apiPath}/Communication/createNewsItem`, {
      method: 'POST',
      body: JSON.stringify(formState),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (response.ok) {
      getNewsItemList();
      // Reset the form after successful submission
      dispatch(resetForm({ formName: newsItemsForm }));
      setShowNewsItemsFrom(false);
    }
    console.log('Form data to be saved:', data);
    dispatch(resetForm({ formName: newsItemsForm }));
  };

  // edit news item handlar
  const handleEditSupplierSubmit = async (editedData: any) => {

    try {



      const response = await fetch(
        `${apiPath}/Communication/editNewsItem/${editedData._id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editedData),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.ok) {
        getNewsItemList();
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
    setIsNewsItemSelected(false);
  };

  // delete news item handlar
  const deleteNewsItem = async (newsItemId: string) => {
    try {
      const response = await axios.delete(
        `${apiPath}/Communication/deleteNewsItem/${newsItemId}`,
      );
      if (response.data.status) {
        setNewsItemList(
          newsItemList.filter((newsItem: any) => newsItem._id !== newsItemId),
        );
        setIsNewsItemSelected(false);
      } else {
        console.error('Error deleting team:', response.data.msg);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-[20px] xl:flex-row item-center bg-white min-h-[80vh]">
        <div className="w-1/2 p-6">
          <div className="flex justify-between p-2">
            <button
              className="bg-blue-200 text-black active:bg-blue-500 
              font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
              type="button"
              onClick={() => {
                setShowNewsItemsFrom(true);
                setIsNewsItemSelected(false);
              }}
            >
              Create news item
            </button>
            <input
              type="search"
              className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-20 focus:outline-none focus:border-blue-500"
              placeholder="To Search..."
            />
          </div>

          {/* news list item */}
          <div>
            <div className="col-span-2">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-hidden">
                  <table className="min-w-full text-left text-sm font-light">
                    <thead className="border-b font-medium dark:border-neutral-500">
                      <tr>
                        
                        <th scope="col" className="px-6 py-4">
                          Title & Content
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Publish Date
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Edit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsItemList.map((newsItem: any, index: number) => (
                        <tr
                          key={newsItem._id}
                          className={`${
                            index % 2 === 0 ? 'bg-gray-100' : ''
                          } border-b dark:border-neutral-500`}
                        >
                         
                          <th className="whitespace-nowrap px-6 py-4">
                          {newsItem.title} <br />
                         
                          </th>
                          <th
                            className="whitespace-nowrap px-6 py-4"
                          >
                            {new Date(newsItem.publishAt).toISOString().split('T')[0]} 
                          </th>
                           <th 
                          onClick={()=>handleNewsItemClick(newsItem)}
                          className="whitespace-nowrap px-6 py-4 cursor-pointer">
                          ✏️ 
                          </th>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l border-gray-300 "></div>

<div className="w-full xl:w-1/2 p-6">
  {showNewsItemsFrom && (
    <form
      onSubmit={handleFormSubmission}
      className="bg-white dark:bg-boxdark p-6"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Create News Item
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          News will remain unpublished until the publish date.
        </p>
      </div>

      {/* Title */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
          News Title
        </label>

        <input
          type="text"
          placeholder="Enter news title..."
          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black dark:text-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-form-strokedark dark:bg-form-input"
          name="title"
          onChange={handleFormChange}
        />
      </div>

      {/* Content */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
          News Content
        </label>

        <textarea
          id="chat"
          name="body"
          onChange={handleFormChange}
          required
          placeholder="Write your news content here..."
          className="w-full h-50 rounded-lg border border-stroke bg-transparent p-4 text-black dark:text-white outline-none transition-all resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-form-strokedark dark:bg-form-input"
        ></textarea>
      </div>

      {/* Publish Date */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
          Publish On
        </label>

        <input
          type="date"
          required
          name="publishAt"
          onChange={handleFormChange}
          className="w-full md:w-64 rounded-lg border border-stroke bg-transparent px-4 py-3 text-black dark:text-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-form-strokedark dark:bg-form-input"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setShowNewsItemsFrom(false)}
          className="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-600 hover:shadow-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
        >
          Save Changes
        </button>
      </div>
    </form>
  )}

  {isNewsItemSelected && (
    <EditNewsItem
      newsItemData={selectedNewsItem}
      handleEditSubmit={handleEditSupplierSubmit}
      deleteNewsItem={deleteNewsItem}
      handleCloseEditForm={setIsNewsItemSelected}
    />
  )}
</div>
      </div>
    </>
  );
}

export default NewsItems;
